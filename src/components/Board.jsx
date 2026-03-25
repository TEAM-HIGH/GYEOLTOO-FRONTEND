import { useState, useRef, useEffect } from 'react'
import ListColumn from './ListColumn'
import searchIcon from '../assets/Search.png'
import filterIcon from '../assets/Filter.png'

// eslint-disable-next-line react-refresh/only-export-components
export const EMOJI_LIST = [
  '😀','🥲','🤩','😑','🤔','😡','😭','🤯','😨','💀',
  '🎉','🎁','🎨','💎','🥊','🏆','🎵','🔔','📢','🎧',
  '💊','🗒️','📁','📌','🍔','🚨','⭐','⚡','🔥','❄️',
  '❤️','💥','⭕','❌','❓','❗','✅','🔴','🟠','🟡',
  '🟢','🔵','🟣','🟤','⚫','⚪',
]

function Board({
  lists,
  filterEmojis, setFilterEmojis,
  urgentMode, setUrgentMode,
  urgentThreshold,
  searchQuery, setSearchQuery,
  expiredAction,
  onAddList,
  onUpdateListTitle, onDeleteList,
  onAddCard, onUpdateCard, onDeleteCard,
}) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [tempEmojis, setTempEmojis] = useState([])  // 저장 전 임시 선택
  const filterRef = useRef(null)

  // 필터 드롭다운 열 때 현재 선택값으로 초기화
  const openFilter = () => {
    setTempEmojis([...filterEmojis])
    setShowFilterDropdown(true)
  }

  // 이모지 토글
  const toggleEmoji = (emoji) => {
    setTempEmojis(prev =>
      prev.includes(emoji) ? prev.filter(e => e !== emoji) : [...prev, emoji]
    )
  }

  // 저장
  const handleFilterConfirm = () => {
    setFilterEmojis(tempEmojis)
    setShowFilterDropdown(false)
  }

  // 취소
  const handleFilterCancel = () => {
    setShowFilterDropdown(false)
  }

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="board">
      {/* 상단 헤더 */}
      <div className="board-header">
        <h1 className="board-title">할일 1</h1>
        <div className="board-header-right">

          {/* 급함 표시 토글 */}
          <button
            className={`header-icon-btn ${urgentMode ? 'on' : ''}`}
            onClick={() => setUrgentMode(!urgentMode)}
            title="급함 표시"
          >
            🚨
          </button>

          {/* 필터 버튼 */}
          <div className="filter-wrapper" ref={filterRef}>
            <button className="header-icon-btn" onClick={openFilter}>
              <img src={filterIcon} alt="필터" className="filter-icon-img" />
              <span>필터</span>
            </button>

            {/* 필터 드롭다운 */}
            {showFilterDropdown && (
              <div className="filter-dropdown">
                <p className="filter-dropdown-title">이모지 필터</p>
                <div className="filter-emoji-grid">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      className={`filter-emoji-btn ${tempEmojis.includes(emoji) ? 'selected' : ''}`}
                      onClick={() => toggleEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="filter-dropdown-btns">
                  <button className="btn-cancel-sm" onClick={handleFilterCancel}>취소</button>
                  <button className="btn-confirm-sm" onClick={handleFilterConfirm}>저장</button>
                </div>
              </div>
            )}
          </div>

          {/* 검색창 */}
          <div className="search-box">
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <img src={searchIcon} alt="검색" className="search-icon-img" />
          </div>

        </div>
      </div>
      <hr className="board-divider" />

      {/* 리스트 컬럼들 */}
      <div className="board-columns">
        {lists.map(list => (
          <ListColumn
            key={list.id}
            list={list}
            filterEmojis={filterEmojis}
            urgentMode={urgentMode}
            urgentThreshold={urgentThreshold}
            searchQuery={searchQuery}
            expiredAction={expiredAction}
            onUpdateListTitle={onUpdateListTitle}
            onDeleteList={onDeleteList}
            onAddCard={onAddCard}
            onUpdateCard={onUpdateCard}
            onDeleteCard={onDeleteCard}
          />
        ))}

        {/* 리스트 추가 버튼 - 다른 리스트와 같은 너비 */}
        <button className="add-list-btn" onClick={onAddList}>+</button>
      </div>
    </div>
  )
}

export default Board
