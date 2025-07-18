import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Label } from '../components/ui/label'

describe('Label', () => {
  it('renders with text', () => {
    const { getByText } = render(<Label>Label</Label>)
    expect(getByText('Label')).toBeInTheDocument()
  })
})
