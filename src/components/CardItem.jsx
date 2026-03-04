import { useState } from 'react'
import { EMOJI_LIST } from './Board'

// 날짜 표시 포맷 (몇 시간 전/후)
function formatDue(dueDate) {
  if (!dueDate) return null
  const diff = new Date(dueDate) - new Date()
  const absDiff = Math.abs(diff)
  const hours = Math.floor(absDiff / (1000 * 60 * 60))
  const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))

  if (diff < 0) return `${hours}시간 ${mins}분 전`
  if (hours < 1) return `${mins}분 후`
  if (hours < 24) return `${hours}시간 후`
  const days = Math.floor(hours / 24)
  return `${days}일 후`
}

function CardItem({ card, listId, isUrgent, onUpdateCard, onDeleteCard }) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 수정 폼 상태
  const [editTitle, setEditTitle] = useState(card.title)
  const [editContent, setEditContent] = useState(card.content)
  const [editEmoji, setEditEmoji] = useState(card.emoji)
  const [editDueDate, setEditDueDate] = useState(card.dueDate || '')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleUpdate = () => {
    onUpdateCard(listId, card.id, {
      title: editTitle,
      content: editContent,
      emoji: editEmoji,
      dueDate: editDueDate || null,
    })
    setIsEditing(false)
    setShowEmojiPicker(false)
    setShowDatePicker(false)
  }

  // 수정 모드
  if (isEditing) {
    return (
      <div className={`card-item editing ${isUrgent ? 'urgent' : ''}`}>
        <input
          className="card-form-title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
        />
        <textarea
          className="card-form-content"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="세부 내용"
        />
        <div className="card-form-icons">
          <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowDatePicker(false) }}>
            {editEmoji || '☺️'}
          </button>
          <button onClick={() => { setShowDatePicker(!showDatePicker); setShowEmojiPicker(false) }}>
            📅
          </button>
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker">
            <button className="emoji-clear" onClick={() => { setEditEmoji(''); setShowEmojiPicker(false) }}>
              ✕ 없음
            </button>
            {EMOJI_LIST.map(emoji => (
              <button
                key={emoji}
                className={`emoji-option ${editEmoji === emoji ? 'selected' : ''}`}
                onClick={() => { setEditEmoji(emoji); setShowEmojiPicker(false) }}
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
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
          </div>
        )}

        <div className="card-form-btns">
          <button className="btn-cancel" onClick={() => setIsEditing(false)}>취소</button>
          <button className="btn-confirm" onClick={handleUpdate}>수정</button>
        </div>
      </div>
    )
  }

  // 일반 표시 모드
  return (
    <div className={`card-item ${isUrgent ? 'urgent' : ''}`}>
      <div className="card-item-header">
        <span className="card-emoji">{card.emoji}</span>
        <span className="card-title">{card.title}</span>
        <div className="card-menu-wrapper">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>···</button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => { setIsEditing(true); setShowMenu(false) }}>✏️ 카드 수정하기</button>
              <button onClick={() => onDeleteCard(listId, card.id)}>🗑️ 카드 삭제하기</button>
            </div>
          )}
        </div>
      </div>

      {card.content && <p className="card-content">{card.content}</p>}

      {card.dueDate && (
        <div className={`card-due ${isUrgent ? 'urgent-text' : ''}`}>
          📅 {formatDue(card.dueDate)}
        </div>
      )}
    </div>
  )
}

export default CardItem
