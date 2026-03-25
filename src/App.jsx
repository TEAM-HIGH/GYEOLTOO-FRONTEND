import { useState, useRef, useEffect } from 'react'
import Board from './components/Board'
import logo from './assets/gyeoltoo.png'
import { fetchBoard, createList, updateList, deleteList, createCard, updateCard, deleteCard } from './api'
import './App.css'

const DOT_COLORS = ['#D97070', '#e1b94a', '#42cc70', '#56aed9', '#955fd8', '#e458ca']
const randomColor = () => DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)]

function App() {
  const [lists, setLists] = useState([])
  const [filterEmojis, setFilterEmojis] = useState([])
  const [urgentMode, setUrgentMode] = useState(false)
  const [urgentThreshold, setUrgentThreshold] = useState(60)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const [showSidebarMenu, setShowSidebarMenu] = useState(false)
  const [showUrgentSetting, setShowUrgentSetting] = useState(false)
  const [showExpiredSetting, setShowExpiredSetting] = useState(false)
  const [thresholdInput, setThresholdInput] = useState(60)
  const [thresholdUnit, setThresholdUnit] = useState('분')
  const [expiredAction, setExpiredAction] = useState('none') // 'none' | 'fade' | 'hide'
  const [expiredActionInput, setExpiredActionInput] = useState('none')
  const sidebarMenuRef = useRef(null)

  // 앱 시작 시 GET /board 로 카드 포함 전체 리스트 한방에 조회
  useEffect(() => {
    async function loadData() {
      try {
        const boardData = await fetchBoard()
        setLists(boardData.map(l => ({ ...l, dotColor: randomColor() })))
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        setLists([])
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

  // 리스트 CRUD
  const addList = async () => {
    try {
      const newList = await createList('새 리스트')
      setLists([...lists, { ...newList, cards: [], dotColor: randomColor() }])
    } catch (err) { console.error('리스트 생성 실패:', err) }
  }

  const updateListTitle = async (listId, newTitle) => {
    try {
      await updateList(listId, newTitle)
      setLists(lists.map(l => l.id === listId ? { ...l, title: newTitle } : l))
    } catch (err) { console.error('리스트 수정 실패:', err) }
  }

  const removeList = async (listId) => {
    try {
      await deleteList(listId)
      setLists(lists.filter(l => l.id !== listId))
    } catch (err) { console.error('리스트 삭제 실패:', err) }
  }

  // 카드 CRUD
  const addCard = async (listId, cardData) => {
    try {
      const newCard = await createCard(listId, cardData)
      setLists(lists.map(l =>
        l.id === listId ? { ...l, cards: [...l.cards, { ...newCard, dueDate: cardData.dueDate }] } : l
      ))
    } catch (err) { console.error('카드 생성 실패:', err) }
  }

  const updateCardItem = async (listId, cardId, updatedData) => {
    try {
      await updateCard(cardId, updatedData)
      setLists(lists.map(l =>
        l.id === listId
          ? { ...l, cards: l.cards.map(c => c.id === cardId ? { ...c, ...updatedData } : c) }
          : l
      ))
    } catch (err) { console.error('카드 수정 실패:', err) }
  }

  const removeCard = async (listId, cardId) => {
    try {
      await deleteCard(cardId)
      setLists(lists.map(l =>
        l.id === listId ? { ...l, cards: l.cards.filter(c => c.id !== cardId) } : l
      ))
    } catch (err) { console.error('카드 삭제 실패:', err) }
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

            {showSidebarMenu && !showUrgentSetting && !showExpiredSetting && (
              <div className="sidebar-dropdown">
                <button onClick={() => setShowUrgentSetting(true)}>🚨 급함 표시 설정</button>
                <button onClick={() => { setExpiredActionInput(expiredAction); setShowExpiredSetting(true) }}>⏰ 기간 만료 카드 설정</button>
                <button onClick={() => {}}>✏️ 이름 변경</button>
              </div>
            )}

            {showUrgentSetting && (
              <div className="sidebar-dropdown urgent-setting">
                <p className="urgent-setting-label">급함 표시 기준</p>
                <div className="urgent-setting-row">
                  <input type="number" min="1" value={thresholdInput}
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

            {showExpiredSetting && (
              <div className="sidebar-dropdown urgent-setting">
                <p className="urgent-setting-label">기간 만료 카드 처리</p>
                <div className="expired-setting-options">
                  <label>
                    <input type="radio" value="none" checked={expiredActionInput === 'none'} onChange={() => setExpiredActionInput('none')} />
                    그냥 유지
                  </label>
                  <label>
                    <input type="radio" value="fade" checked={expiredActionInput === 'fade'} onChange={() => setExpiredActionInput('fade')} />
                    반투명 처리
                  </label>
                  <label>
                    <input type="radio" value="hide" checked={expiredActionInput === 'hide'} onChange={() => setExpiredActionInput('hide')} />
                    자동 숨김
                  </label>
                </div>
                <div className="urgent-setting-btns">
                  <button className="btn-cancel-sm" onClick={() => { setShowExpiredSetting(false); setShowSidebarMenu(false) }}>취소</button>
                  <button className="btn-confirm-sm" onClick={() => { setExpiredAction(expiredActionInput); setShowExpiredSetting(false); setShowSidebarMenu(false) }}>완료</button>
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
        expiredAction={expiredAction}
        onAddList={addList}
        onUpdateListTitle={updateListTitle}
        onDeleteList={removeList}
        onAddCard={addCard}
        onUpdateCard={updateCardItem}
        onDeleteCard={removeCard}
      />
    </div>
  )
}

export default App
