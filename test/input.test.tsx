import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '../components/ui/input'

describe('Input', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text" />)
    expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
  })
})
