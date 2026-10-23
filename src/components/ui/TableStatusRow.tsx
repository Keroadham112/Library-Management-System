import { CircleOff, LoaderCircle } from 'lucide-react'

type TableStatusRowProps = {
  colSpan: number
  state: 'loading' | 'empty'
  loadingText: string
  emptyText: string
}

function TableStatusRow({ colSpan, state, loadingText, emptyText }: TableStatusRowProps) {
  if (state === 'loading') {
    return (
      <tr>
        <td className="empty-cell" colSpan={colSpan}>
          <span className="table-state-inline">
            <LoaderCircle className="spin" size={16} />
            {loadingText}
          </span>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="empty-cell" colSpan={colSpan}>
        <span className="table-state-inline">
          <CircleOff size={16} />
          {emptyText}
        </span>
      </td>
    </tr>
  )
}

export default TableStatusRow
