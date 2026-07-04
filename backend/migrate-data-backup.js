import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'brainquest.db');

// Helper to safely parse SQL strings
function extractSQLValues(sqlContent) {
  // Find VALUES clause
  const valuesMatch = sqlContent.match(/VALUES\s*\((.*)\);?$/is);
  if (!valuesMatch) return [];

  const valuesStr = valuesMatch[1];
  const rows = [];

  // Parse row by row - more robust approach
  let i = 0;
  while (i < valuesStr.length) {
    if (valuesStr[i] === '(') {
      let depth = 1;
      let j = i + 1;
      let inString = false;
      let stringChar = '';

      while (j < valuesStr.length && depth > 0) {
        if (!inString && (valuesStr[j] === '"' || valuesStr[j] === "'")) {
          inString = true;
          stringChar = valuesStr[j];
        } else if (inString && valuesStr[j] === stringChar && valuesStr[j - 1] !== '\\') {
          inString = false;
        } else if (!inString) {
          if (valuesStr[j] === '(') depth++;
          if (valuesStr[j] === ')') depth--;
        }
        j++;
      }

      rows.push(valuesStr.substring(i + 1, j - 1));
      i = j;
    } else {
      i++;
    }
  }

  return rows;
}

// Parse materials from SQL
const materialsSQL = fs.readFileSync(path.join(__dirname, '..', 'materials_rows.sql'), 'utf-8');
const materialsRows = extractSQLValues(materialsSQL);

function parseMaterialRow(rowStr) {
  const fields = [];
  let field = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    const prevChar = i > 0 ? rowStr[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString && char === ',') {
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }

  if (field.trim()) {
    fields.push(field.trim());
  }

  if (fields.length < 3) return null;

  const cleanValue = (v) => {
    v = v.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\'/g, "'").replace(/\\"/g, '"');
  };

  return {
    id: parseInt(fields[0]) || 0,
    title: cleanValue(fields[1]),
    content: cleanValue(fields[2]),
    category: fields[3] ? cleanValue(fields[3]) : 'Umum',
    status: fields[4] ? cleanValue(fields[4]) : 'Public',
    img: fields[5] ? cleanValue(fields[5]) : null,
    parent_id: fields[6] && fields[6].trim().toLowerCase() !== 'null' ? parseInt(fields[6]) : null,
    difficulty_level: fields[4] && cleanValue(fields[4]) === 'Khusus Member' ? 'Lanjutan' : 'Pemula',
  };
}

const materials = materialsRows
  .map(parseMaterialRow)
  .filter((m) => m !== null);

console.log(`✓ Found ${materials.length} materials`);

// Parse questions from SQL
const questionsSQL = fs.readFileSync(path.join(__dirname, '..', 'questions_rows.sql'), 'utf-8');
const questionsRows = extractSQLValues(questionsSQL);

function parseQuestionRow(rowStr) {
  const fields = [];
  let field = '';
  let inString = false;
  let stringChar = '';
  let bracketDepth = 0;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    const prevChar = i > 0 ? rowStr[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '[') bracketDepth++;
      if (char === ']') bracketDepth--;
    }

    if (!inString && bracketDepth === 0 && char === ',') {
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }

  if (field.trim()) {
    fields.push(field.trim());
  }

  if (fields.length < 5) return null;

  const cleanValue = (v) => {
    v = v.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n');
  };

  const id = parseInt(fields[0]) || 0;
  const material_id = parseInt(fields[1]) || 0;
  const question = cleanValue(fields[2]);

  // Parse options
  let optionsStr = fields[3].trim();
  const options = [];

  try {
    // Try parsing as JSON first
    const jsonStr = optionsStr.replace(/^['"]|['"]$/g, '');
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      options.push(...parsed);
    }
  } catch (e) {
    // If JSON parsing fails, extract manually
    const matches = optionsStr.match(/"([^"\\]|\\.)*"/g) || [];
    for (const match of matches) {
      options.push(cleanValue(match));
    }
  }

  const answerIndex = parseInt(fields[4]) || 0;
  const correctAnswer = options[answerIndex] || (options.length > 0 ? options[0] : '');

  return {
    id,
    material_id,
    question_text: question,
    option_a: options[0] || '',
    option_b: options[1] || '',
    option_c: options[2] || '',
    option_d: options[3] || '',
    correct_answer: correctAnswer,
  };
}

const questions = questionsRows
  .map(parseQuestionRow)
  .filter((q) => q !== null);

console.log(`✓ Found ${questions.length} questions`);

// Database migration
async function migrateData() {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    await db.exec('PRAGMA foreign_keys = ON');

    // Insert materials
    console.log('\n📥 Inserting materials...');
    let materialsInserted = 0;
    for (const material of materials) {
      try {
        await db.run(
          `INSERT OR IGNORE INTO materials (id, title, content, category, difficulty_level, status, img, parent_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            material.id,
            material.title,
            material.content,
            material.category,
            material.difficulty_level,
            material.status,
            material.img,
            material.parent_id
          ]
        );
        materialsInserted++;
      } catch (err) {
        console.log(`  ⚠ Skipped material: ${err.message}`);
      }
    }
    console.log(`✓ Inserted ${materialsInserted} materials`);

    // Insert questions
    console.log('\n❓ Inserting questions...');
    let questionsInserted = 0;
    let questionsFailed = 0;

    for (const question of questions) {
      try {
        await db.run(
          `INSERT OR IGNORE INTO questions 
           (id, material_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            question.id,
            question.material_id,
            question.question_text,
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
            question.correct_answer,
          ]
        );
        questionsInserted++;
      } catch (err) {
        questionsFailed++;
        if (questionsFailed <= 5) {
          console.log(`  ⚠ Skipped question #${question.id}: ${err.message}`);
        }
      }
    }
    if (questionsFailed > 5) {
      console.log(`  ⚠ ... and ${questionsFailed - 5} more`);
    }
    console.log(`✓ Inserted ${questionsInserted} questions`);

    // Verify
    const materialCount = await db.get('SELECT COUNT(*) as count FROM materials');
    const questionCount = await db.get('SELECT COUNT(*) as count FROM questions');

    console.log('\n✨ Migration Summary:');
    console.log(`  📚 Total materials: ${materialCount.count}`);
    console.log(`  ❓ Total questions: ${questionCount.count}`);

    await db.close();
    console.log('\n✓ Migration completed successfully!\n');
  } catch (err) {
    console.error('✗ Migration error:', err);
    process.exit(1);
  }
}

migrateData();
