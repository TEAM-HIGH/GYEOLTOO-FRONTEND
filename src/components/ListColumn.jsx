import { useState, useRef, useEffect } from 'react'
import CardItem from './CardItem'
import { EMOJI_LIST } from './Board'

// 마감 임박 여부 (urgentThreshold: 분 단위)
function isUrgent(dueDate, urgentThreshold) {
  if (!dueDate) return false
  const diff = new Date(dueDate) - new Date()
  return diff > 0 && diff < urgentThreshold * 60 * 1000
}

function ListColumn({
  list,
  filterEmojis, urgentMode, urgentThreshold, searchQuery,
  expiredAction,
  onUpdateListTitle, onDeleteList,
  onAddCard, onUpdateCard, onDeleteCard,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(list.title)
  const [showMenu, setShowMenu] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const menuRef = useRef(null)

  // 카드 폼 상태
  const [cardTitle, setCardTitle] = useState('')
  const [cardContent, setCardContent] = useState('')
  const [cardEmoji, setCardEmoji] = useState('')
  const [cardDueDate, setCardDueDate] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // 외부 클릭 시 ... 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTitleSubmit = () => {
    onUpdateListTitle(list.id, titleInput)
    setIsEditingTitle(false)
  }

  const handleAddCard = () => {
    if (!cardTitle.trim()) return
    onAddCard(list.id, {
      title: cardTitle,
      content: cardContent,
      emoji: cardEmoji,
      dueDate: cardDueDate || null,
    })
    setCardTitle('')
    setCardContent('')
    setCardEmoji('')
    setCardDueDate('')
    setShowCardForm(false)
    setShowEmojiPicker(false)
    setShowDatePicker(false)
  }

  // 카드 필터링 (이모지 복수선택 + 검색 + 기간 만료 처리)
  const filteredCards = list.cards.filter(card => {
    const matchEmoji = filterEmojis.length > 0 ? filterEmojis.includes(card.emoji) : true
    const matchSearch = searchQuery
      ? card.title.includes(searchQuery) || card.content?.includes(searchQuery)
      : true
    const isExpired = card.dueDate && new Date(card.dueDate) < new Date()
    if (expiredAction === 'hide' && isExpired) return false
    return matchEmoji && matchSearch
  })

  return (
    <div className="list-column">
      {/* 리스트 헤더 */}
      <div className="list-header">
        <span className="list-dot" style={{ backgroundColor: list.dotColor }} />
        {isEditingTitle ? (
          <input
            className="list-title-input"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
          />
        ) : (
          <span className="list-title" onDoubleClick={() => setIsEditingTitle(true)}>
            {list.title}
          </span>
        )}

        <div className="list-menu-wrapper" ref={menuRef}>
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>···</button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => { setIsEditingTitle(true); setShowMenu(false) }}>✏️ 제목 수정</button>
              <button onClick={() => { onDeleteList(list.id); setShowMenu(false) }}>🗑️ 리스트 삭제</button>
            </div>
          )}
        </div>
      </div>

      {/* 카드 목록 - 세로 스크롤 */}
      <div className="card-list">
        {filteredCards.map(card => {
          const isExpired = card.dueDate && new Date(card.dueDate) < new Date()
          return (
            <CardItem
              key={card.id}
              card={card}
              listId={list.id}
              urgentMode={urgentMode}
              isUrgent={urgentMode && isUrgent(card.dueDate, urgentThreshold)}
              isExpired={expiredAction === 'fade' && isExpired}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          )
        })}
      </div>

      {/* 카드 추가 폼 */}
      {showCardForm && (
        <div className="card-form">
          <input
            className="card-form-title"
            placeholder="목표 한 줄 쓰기..."
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
          />
          <textarea
            className="card-form-content"
            placeholder="세부 내용"
            value={cardContent}
            onChange={(e) => setCardContent(e.target.value)}
          />
          <div className="card-form-icons">
            <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowDatePicker(false) }}>
              {cardEmoji || '☺️'}
            </button>
            <button onClick={() => { setShowDatePicker(!showDatePicker); setShowEmojiPicker(false) }}>
              📅
            </button>
          </div>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <button className="emoji-clear" onClick={() => { setCardEmoji(''); setShowEmojiPicker(false) }}>✕ 없음</button>
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  className={`emoji-option ${cardEmoji === emoji ? 'selected' : ''}`}
                  onClick={() => { setCardEmoji(emoji); setShowEmojiPicker(false) }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          {showDatePicker && (
            <div className="date-picker-wrapper">
              <input
                type="datetime-local"
                value={cardDueDate}
                onChange={(e) => setCardDueDate(e.target.value)}
              />
            </div>
          )}
          <div className="card-form-btns">
            <button className="btn-cancel" onClick={() => { setShowCardForm(false); setShowEmojiPicker(false); setShowDatePicker(false) }}>취소</button>
            <button className="btn-confirm" onClick={handleAddCard}>완료</button>
          </div>
        </div>
      )}

      {/* + 카드 추가 버튼 */}
      <button className="add-card-btn" onClick={() => setShowCardForm(true)}>+</button>
    </div>
  )
}

export default ListColumn
