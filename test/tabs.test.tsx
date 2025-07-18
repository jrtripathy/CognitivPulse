import { render } from '@testing-library/react'
import { Tabs } from '../components/ui/tabs'

describe('Tabs', () => {
  it('renders without crashing', () => {
    render(<Tabs value="tab1" onValueChange={() => {}}><div>Tab1</div></Tabs>)
  })
})
