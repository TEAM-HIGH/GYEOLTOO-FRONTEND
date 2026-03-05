// 서버 주소 - 
const BASE_URL = 'http://localhost:8080'

// ── 리스트 ──────────────────────────────────────────

// 모든 리스트 조회
export async function fetchLists() {
  const res = await fetch(`${BASE_URL}/list`)
  if (!res.ok) throw new Error('리스트 조회 실패')
  return res.json()
}

// 리스트 생성
export async function createList(title) {
  const res = await fetch(`${BASE_URL}/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('리스트 생성 실패')
  return res.json() // { id, title }
}

// 리스트 제목 수정
export async function updateList(listId, title) {
  const res = await fetch(`${BASE_URL}/list/${listId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('리스트 수정 실패')
}

// 리스트 삭제
export async function deleteList(listId) {
  const res = await fetch(`${BASE_URL}/list/${listId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('리스트 삭제 실패')
}

// ── 카드 ──────────────────────────────────────────

// 특정 리스트의 카드 목록 조회
export async function fetchCards(listId) {
  const res = await fetch(`${BASE_URL}/list/${listId}/cards`)
  if (!res.ok) throw new Error('카드 조회 실패')
  return res.json() // [{ id, title, completed, emoji, content, dueDate }, ...]
}

// 카드 생성
export async function createCard(listId, cardData) {
  const res = await fetch(`${BASE_URL}/cards/${listId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
    // cardData = { title, content, emoji, dueDate }
  })
  if (!res.ok) throw new Error('카드 생성 실패')
  return res.json() // { id, title, content, emoji, completed }
}

// 카드 수정
export async function updateCard(cardId, cardData) {
  const res = await fetch(`${BASE_URL}/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
    // cardData = { title, content, emoji, completed, dueDate }
  })
  if (!res.ok) throw new Error('카드 수정 실패')
}

// 카드 삭제
export async function deleteCard(cardId) {
  const res = await fetch(`${BASE_URL}/cards/${cardId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('카드 삭제 실패')
}
