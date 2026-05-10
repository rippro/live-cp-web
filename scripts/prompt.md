# Codexに問題生成させてスクリプトに渡す例
node scripts/create-problem.js my-event '{"title":"...","statement":"...","solutionCode":"...","timeLimitMs":2000,"points":100,"testcases":[...]}'

# 確認だけ
node scripts/create-problem.js my-event --dry-run '<json>'

Codexに渡すJSONスキーマ（コメントにも書いてある）:
{
  "title": "文字列",
  "statement": "Markdown",
  "solutionCode": "Python 3コード",
  "timeLimitMs": 2000,
  "points": 100,
  "isPublished": false,
  "testcases": [
    {"type": "sample", "input": "...", "expectedOutput": "..."},
    {"type": "hidden", "input": "...", "expectedOutput": "..."}
  ]
}
