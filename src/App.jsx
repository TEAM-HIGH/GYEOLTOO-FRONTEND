import { useState, useRef, useEffect } from 'react'
import Board from './components/Board'
import logo from './assets/gyeoltoo.png'
import * as api from './api'
import './App.css'

function App() {
  const [lists, setLists] = useState([])
  const [filterEmojis, setFilterEmojis] = useState([])
  const [urgentMode, setUrgentMode] = useState(false)
  const [urgentThreshold, setUrgentThreshold] = useState(60)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)  // 로딩 상태

  // 사이드바 ... 메뉴 상태
  const [showSidebarMenu, setShowSidebarMenu] = useState(false)
  const [showUrgentSetting, setShowUrgentSetting] = useState(false)
  const [thresholdInput, setThresholdInput] = useState(60)
  const [thresholdUnit, setThresholdUnit] = useState('분')
  const sidebarMenuRef = useRef(null)

  // ── 앱 시작할 때 서버에서 데이터 불러오기 ──────────────
  useEffect(() => {
    async function loadData() {
      try {
        // 1. 리스트 전체 조회
        const listData = await api.fetchLists()

        // 2. 각 리스트마다 카드 조회
        const listsWithCards = await Promise.all(
          listData.map(async (list) => {
            const cards = await api.fetchCards(list.id)
            return { ...list, cards }
          })
        )
        setLists(listsWithCards)
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        // 서버 연결 안 될 때 더미 데이터로 대체
        setLists([
          {
            id: 1, title: '리스트1',
            cards: [
              { id: 1, title: '집가고싶다', content: '', emoji: '😭', dueDate: null, completed: false },
            ],
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 외부 클릭 시 사이드바 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(e.target)) {
        setShowSidebarMenu(false)
        setShowUrgentSetting(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUrgentSettingConfirm = () => {
    const minutes = thresholdUnit === '시간' ? thresholdInput * 60 : thresholdInput
    setUrgentThreshold(minutes)
    setShowUrgentSetting(false)
    setShowSidebarMenu(false)
  }

  // ── 리스트 CRUD ──────────────────────────────────────

  const addList = async () => {
    try {
      const newList = await api.createList('새 리스트')  // 서버에 저장
      setLists([...lists, { ...newList, cards: [] }])    // 받아온 id 사용
    } catch (err) {
      console.error('리스트 생성 실패:', err)
    }
  }

  const updateListTitle = async (listId, newTitle) => {
    try {
      await api.updateList(listId, newTitle)             // 서버에 수정
      setLists(lists.map(l => l.id === listId ? { ...l, title: newTitle } : l))
    } catch (err) {
      console.error('리스트 수정 실패:', err)
    }
  }

  const deleteList = async (listId) => {
    try {
      await api.deleteList(listId)                       // 서버에서 삭제
      setLists(lists.filter(l => l.id !== listId))
    } catch (err) {
      console.error('리스트 삭제 실패:', err)
    }
  }

  // ── 카드 CRUD ──────────────────────────────────────

  const addCard = async (listId, cardData) => {
    try {
      const newCard = await api.createCard(listId, cardData)  // 서버에 저장
      setLists(lists.map(l =>
        l.id === listId ? { ...l, cards: [...l.cards, { ...newCard, dueDate: cardData.dueDate }] } : l
      ))
    } catch (err) {
      console.error('카드 생성 실패:', err)
    }
  }

  const updateCard = async (listId, cardId, updatedData) => {
    try {
      await api.updateCard(cardId, updatedData)          // 서버에 수정
      setLists(lists.map(l =>
        l.id === listId
          ? { ...l, cards: l.cards.map(c => c.id === cardId ? { ...c, ...updatedData } : c) }
          : l
      ))
    } catch (err) {
      console.error('카드 수정 실패:', err)
    }
  }

  const deleteCard = async (listId, cardId) => {
    try {
      await api.deleteCard(cardId)                       // 서버에서 삭제
      setLists(lists.map(l =>
        l.id === listId ? { ...l, cards: l.cards.filter(c => c.id !== cardId) } : l
      ))
    } catch (err) {
      console.error('카드 삭제 실패:', err)
    }
  }

  if (loading) return <div className="loading">불러오는 중...</div>

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="결투 로고" />
        </div>
        <div className="sidebar-item active">
          <span className="sidebar-tab-title">할일 1</span>
          <div className="sidebar-menu-wrapper" ref={sidebarMenuRef}>
            <button
              className="sidebar-menu-btn"
              onClick={(e) => {
                e.stopPropagation()
                setShowSidebarMenu(!showSidebarMenu)
                setShowUrgentSetting(false)
              }}
            >···</button>

            {showSidebarMenu && !showUrgentSetting && (
              <div className="sidebar-dropdown">
                <button onClick={() => setShowUrgentSetting(true)}>🚨 급함 표시 설정</button>
                <button onClick={() => {}}>✏️ 이름 변경</button>
              </div>
            )}

            {showUrgentSetting && (
              <div className="sidebar-dropdown urgent-setting">
                <p className="urgent-setting-label">급함 표시 기준</p>
                <div className="urgent-setting-row">
                  <input
                    type="number"
                    min="1"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(Number(e.target.value))}
                    className="urgent-input"
                  />
                  <button className={`unit-toggle ${thresholdUnit === '분' ? 'active' : ''}`} onClick={() => setThresholdUnit('분')}>분</button>
                  <button className={`unit-toggle ${thresholdUnit === '시간' ? 'active' : ''}`} onClick={() => setThresholdUnit('시간')}>시간</button>
                </div>
                <div className="urgent-setting-btns">
                  <button className="btn-cancel-sm" onClick={() => { setShowUrgentSetting(false); setShowSidebarMenu(false) }}>취소</button>
                  <button className="btn-confirm-sm" onClick={handleUrgentSettingConfirm}>완료</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <Board
        lists={lists}
        filterEmojis={filterEmojis}
        setFilterEmojis={setFilterEmojis}
        urgentMode={urgentMode}
        setUrgentMode={setUrgentMode}
        urgentThreshold={urgentThreshold}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddList={addList}
        onUpdateListTitle={updateListTitle}
        onDeleteList={deleteList}
        onAddCard={addCard}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
      />
    </div>
  )
}

export default App
