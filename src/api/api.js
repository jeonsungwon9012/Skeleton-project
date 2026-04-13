const express = require('express');

const fs = require('fs/promises');

const path = require('path');

const app = express();

const port = 3000;

// 현재 파일 위치(src/api)에서 루트의 db/db.json을 찾으려면 ../../db/db.json이어야 합니다.
const dataFilePath = path.resolve(__dirname, '../../db/db.json');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

// json-server처럼 /CATEGORY, /USER 등의 경로를 동적으로 처리
app.get('/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    const data = await readDataFile();

    if (data[resource]) {
      let result = data[resource];

      // 쿼리 필터링 지원 (예: ?email=... 또는 ?uid=1)
      if (Object.keys(req.query).length > 0) {
        result = result.filter((item) => {
          return Object.keys(req.query).every((key) => {
            // db.json의 ID는 숫자이므로 타입을 맞춰서 비교
            return String(item[key]) === String(req.query[key]);
          });
        });
      }

      res.json(result);
    } else {
      res.status(404).json({ error: `Resource ${resource} not found` });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

// 특정 ID 데이터 가져오기 (예: GET /USER/1)
app.get('/:resource/:id', async (req, res) => {
  try {
    const { resource, id } = req.params;
    const data = await readDataFile();

    if (data[resource]) {
      // ID 비교 시 데이터 타입(숫자/문자열)에 상관없이 비교하기 위해 String() 사용
      const item = data[resource].find(
        (item) => String(item.id) === String(id),
      );
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } else {
      res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 데이터 삭제 (예: DELETE /BUDGET/1)
app.delete('/:resource/:id', async (req, res) => {
  try {
    const { resource, id } = req.params;
    const data = await readDataFile();

    if (!data[resource]) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const index = data[resource].findIndex(
      (item) => String(item.id) === String(id),
    );

    if (index !== -1) {
      const deletedItem = data[resource].splice(index, 1)[0];
      await writeDataFile(data);
      res.json(deletedItem);
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function readDataFile() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    // db.json은 객체 형식이므로 기본값을 {}로 설정해야 안전합니다.
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('파일 읽기 오류:', error);
    return {};
  }
}

// ==============================
// Helper 함수: 데이터 파일 쓰기
// 기능: JS 배열을 JSON 문자열로 바꿔 data.json 파일에 저장
// ==============================
async function writeDataFile(data) {
  // JSON.stringify(data, null, 2)
  // null, 2는 보기 좋게 들여쓰기 2칸으로 저장
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ==============================
// 서버 실행
// localhost:3000 에서 서버 시작
// ==============================
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
