import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
	it('renders default button', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByText('Click me')).toBeInTheDocument()
	})

	it('applies custom className', () => {
		render(<Button className="custom">Click me</Button>)
		expect(screen.getByText('Click me')).toHaveClass('custom')
	})

	it('renders as button tag by default', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByRole('button')).toBeInTheDocument()
	})

	it('renders different variants', () => {
		render(
			<>
				<Button variant="default">Default</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
			</>
		)

		expect(screen.getByText('Default')).toHaveClass('bg-primary')
		expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')
		expect(screen.getByText('Outline')).toHaveClass('border-input')
		expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')
		expect(screen.getByText('Ghost')).toHaveClass('hover:bg-accent')
		expect(screen.getByText('Link')).toHaveClass('text-primary')
	})

	it('renders different sizes', () => {
		render(
			<>
				<Button size="default">Default</Button>
				<Button size="sm">Small</Button>
				<Button size="lg">Large</Button>
				<Button size="icon">Icon</Button>
			</>
		)

		expect(screen.getByText('Default')).toHaveClass('h-9')
		expect(screen.getByText('Small')).toHaveClass('h-8')
		expect(screen.getByText('Large')).toHaveClass('h-10')
		expect(screen.getByText('Icon')).toHaveClass('h-9', 'w-9')
	})
})
