// 서버 주소
const BASE_URL = 'https://gyeoltoo.onrender.com'

// ── 리스트 ──────────────────────────────────────────

// 카드 포함 전체 리스트 한방에 조회 (GET /board)
export async function fetchBoard() {
  const res = await fetch(`${BASE_URL}/board`)
  if (!res.ok) throw new Error('보드 조회 실패')
  return res.json()
  // [{ id, title, cards: [{ id, title, emoji, completed, ... }] }]
}

// 리스트 생성
export async function createList(title) {
  const res = await fetch(`${BASE_URL}/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('리스트 생성 실패')
  return res.json()
}

// 리스트 제목 수정 (/list 임! /lists 아님)
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
  const res = await fetch(`${BASE_URL}/lists/${listId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('리스트 삭제 실패')
}

// ── 카드 ──────────────────────────────────────────

// 카드 생성 (/lists/{listId}/cards 임!)
export async function createCard(listId, cardData) {
  // datetime-local은 "2025-01-09T23:59" 형식인데
  // 서버는 "2025-01-09T23:59:00" 형식을 원함 → :00 붙여주기
  const formattedData = {
    ...cardData,
    dueDate: cardData.dueDate ? cardData.dueDate + ':00' : null,
  }
  const res = await fetch(`${BASE_URL}/lists/${listId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedData),
  })
  if (!res.ok) throw new Error('카드 생성 실패')
  return res.json()
}

// 카드 수정
export async function updateCard(cardId, cardData) {
  const formattedData = {
    ...cardData,
    dueDate: cardData.dueDate ? cardData.dueDate + ':00' : null,
  }
  const res = await fetch(`${BASE_URL}/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedData),
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
