import { render } from '@testing-library/react'
import { Calendar } from '../components/ui/calendar'

describe('Calendar', () => {
  it('renders without crashing', () => {
    render(<Calendar />)
  })
})
