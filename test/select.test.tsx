import { render } from '@testing-library/react'
import { Select } from '../components/ui/select'

describe('Select', () => {
  it('renders without crashing', () => {
    render(<Select><option value="1">One</option></Select>)
  })
})
