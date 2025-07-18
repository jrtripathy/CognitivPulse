import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../components/ui/button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies variant and size', () => {
    render(<Button variant="destructive" size="lg">Delete</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/bg-red-600/)
    expect(btn.className).toMatch(/h-11/)
  })

  it('supports asChild', () => {
    render(<Button asChild><a href="#">Link</a></Button>)
    expect(screen.getByText('Link').tagName).toBe('A')
  })
})
