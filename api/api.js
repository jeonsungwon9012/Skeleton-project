const express = require('express');

const fs = require('fs/promises');

const path = require('path');

const app = express();

const port = 3000;

const dataFilePath = path.join(__dirname, '..', 'db', 'db.json');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

// 모든 데이터 가져오기
app.get('/api/data', async (req, res) => {
  try {
    const data = await readDataFile();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

// 데이터 삭제
app.delete('/api/data/:id', async (req, res) => {
  try {
    // URL에서 id 추출 후 숫자로 변환
    const id = Number(req.params.id);

    // 기존 데이터 읽기
    const data = await readDataFile();

    // 삭제할 데이터의 index 찾기
    const index = data.findIndex((item) => item.id === id);

    // 해당 데이터가 존재하면
    if (index !== -1) {
      // splice(index, 1) : index 위치에서 1개 삭제
      // [0] : 삭제된 첫 번째 요소 꺼내기
      const deletedItem = data.splice(index, 1)[0];

      // 삭제 후 남은 데이터 다시 파일에 저장
      await writeDataFile(data);

      // 삭제된 데이터 응답
      res.json(deletedItem);
    } else {
      // 삭제 대상이 없으면 404
      res.status(404).json({ error: 'Not Found' });
    }
  } catch (error) {
    // 서버 내부 오류 응답
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function readDataFile() {
  // data.json 파일을 UTF-8 문자열로 읽기
  const data = await fs.readFile(dataFilePath, 'utf-8');

  // 파일 내용이 있으면 JSON.parse로 JS 객체/배열로 변환
  // 비어 있으면 빈 배열 반환
  return data ? JSON.parse(data) : [];
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
