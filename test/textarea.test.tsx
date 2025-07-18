import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Textarea } from '../components/ui/textarea'

describe('Textarea', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(<Textarea placeholder="Type here..." />)
    expect(getByPlaceholderText('Type here...')).toBeInTheDocument()
  })
})
