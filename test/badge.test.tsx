import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge } from '../components/ui/badge'

describe('Badge', () => {
  it('renders children', () => {
    const { getByText } = render(<Badge>Badge</Badge>)
    expect(getByText('Badge')).toBeInTheDocument()
  })
})
