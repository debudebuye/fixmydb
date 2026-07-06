import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
    render(<App />, { container: root })
    expect(screen.getByText(/FixMyDB/i)).toBeInTheDocument()
  })
})
