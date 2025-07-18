import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card } from '../components/ui/card'

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(<Card>Card Content</Card>)
    expect(getByText('Card Content')).toBeInTheDocument()
  })
})
