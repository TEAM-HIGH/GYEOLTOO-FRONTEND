import { useState, useRef, useEffect } from 'react'
import Board from './components/Board'
import logo from './assets/gyeoltoo.png'
import './App.css'

const initialLists = [
  {
    id: 1,
    title: '리스트1',
    cards: [
      { id: 1, title: '집가고싶다', content: '진짜 너무 가고싶다', emoji: '😭', dueDate: null, completed: false },
      { id: 2, title: '밥먹고싶다', content: '', emoji: '🍔', dueDate: null, completed: false },
    ],
  },
  {
    id: 2,
    title: '리스트2',
    cards: [
      { id: 3, title: '자고싶다', content: '', emoji: '💀', dueDate: null, completed: false },
    ],
  },
]

let nextId = 100

function App() {
  const [lists, setLists] = useState(initialLists)
  const [filterEmojis, setFilterEmojis] = useState([])   // 복수선택 이모지 필터
  const [urgentMode, setUrgentMode] = useState(false)
  const [urgentThreshold, setUrgentThreshold] = useState(60) // 분 단위
  const [searchQuery, setSearchQuery] = useState('')

  // 사이드바 ... 메뉴 상태
  const [showSidebarMenu, setShowSidebarMenu] = useState(false)
  const [showUrgentSetting, setShowUrgentSetting] = useState(false)
  const [thresholdInput, setThresholdInput] = useState(60)
  const [thresholdUnit, setThresholdUnit] = useState('분') // '분' or '시간'
  const sidebarMenuRef = useRef(null)

  // 외부 클릭 시 드롭다운 닫기
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

  // 리스트 CRUD
  const addList = () => {
    setLists([...lists, { id: nextId++, title: '새 리스트', cards: [] }])
  }
  const updateListTitle = (listId, newTitle) =>
    setLists(lists.map(l => l.id === listId ? { ...l, title: newTitle } : l))
  const deleteList = (listId) =>
    setLists(lists.filter(l => l.id !== listId))

  // 카드 CRUD
  const addCard = (listId, cardData) => {
    const newCard = { id: nextId++, completed: false, ...cardData }
    setLists(lists.map(l => l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l))
  }
  const updateCard = (listId, cardId, updatedData) =>
    setLists(lists.map(l =>
      l.id === listId
        ? { ...l, cards: l.cards.map(c => c.id === cardId ? { ...c, ...updatedData } : c) }
        : l
    ))
  const deleteCard = (listId, cardId) =>
    setLists(lists.map(l =>
      l.id === listId ? { ...l, cards: l.cards.filter(c => c.id !== cardId) } : l
    ))

  return (
    <div className="app-layout">
      {/* 사이드바 */}
      <aside className="sidebar">
        {/* 로고 */}
        <div className="sidebar-logo">
          <img src={logo} alt="결투 로고" />
        </div>

        {/* 탭 (장식) + ... 메뉴 */}
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

            {/* 기본 드롭다운 */}
            {showSidebarMenu && !showUrgentSetting && (
              <div className="sidebar-dropdown">
                <button onClick={() => { setShowUrgentSetting(true) }}>
                  🚨 급함 표시 설정
                </button>
                <button onClick={() => {}}>
                  ✏️ 이름 변경
                </button>
              </div>
            )}

            {/* 급함 표시 설정 드롭다운 */}
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
                  <button
                    className={`unit-toggle ${thresholdUnit === '분' ? 'active' : ''}`}
                    onClick={() => setThresholdUnit('분')}
                  >분</button>
                  <button
                    className={`unit-toggle ${thresholdUnit === '시간' ? 'active' : ''}`}
                    onClick={() => setThresholdUnit('시간')}
                  >시간</button>
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

      {/* 메인 보드 */}
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
