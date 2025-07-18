import { render } from '@testing-library/react'
import { Popover } from '../components/ui/popover'

describe('Popover', () => {
  it('renders without crashing', () => {
    render(<Popover><div>Popover Content</div></Popover>)
  })
})
