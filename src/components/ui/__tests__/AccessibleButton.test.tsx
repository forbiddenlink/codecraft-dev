import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleButton } from '../AccessibleButton';

describe('AccessibleButton', () => {
  it('should render with children', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should support keyboard navigation (Enter)', () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should support keyboard navigation (Space)', () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', async () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick} disabled>Click me</AccessibleButton>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<AccessibleButton loading>Click me</AccessibleButton>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply correct variant classes', () => {
    const { rerender } = render(<AccessibleButton variant="primary">Primary</AccessibleButton>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');

    rerender(<AccessibleButton variant="danger">Danger</AccessibleButton>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');

    rerender(<AccessibleButton variant="success">Success</AccessibleButton>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-600');
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<AccessibleButton size="sm">Small</AccessibleButton>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('text-sm');

    rerender(<AccessibleButton size="lg">Large</AccessibleButton>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-lg');
  });

  it('should render with icon', () => {
    const icon = <svg data-testid="test-icon" />;
    render(<AccessibleButton icon={icon}>With Icon</AccessibleButton>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should position icon correctly', () => {
    const icon = <svg data-testid="test-icon" />;
    const { rerender } = render(
      <AccessibleButton icon={icon} iconPosition="left">Icon Left</AccessibleButton>
    );

    let button = screen.getByRole('button');
    let iconElement = screen.getByTestId('test-icon');
    let children = Array.from(button.children);

    // Icon should be first child
    expect(children[0]).toBe(iconElement);

    rerender(<AccessibleButton icon={icon} iconPosition="right">Icon Right</AccessibleButton>);
    button = screen.getByRole('button');
    iconElement = screen.getByTestId('test-icon');
    children = Array.from(button.children);

    // Icon should be last child
    expect(children[children.length - 1]).toBe(iconElement);
  });

  it('should be full width when specified', () => {
    render(<AccessibleButton fullWidth>Full Width</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('should have accessible focus styles', () => {
    render(<AccessibleButton>Focus me</AccessibleButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-4');
    expect(button).toHaveClass('focus:ring-offset-2');
  });

  it('should prevent click when loading', async () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick} loading>Loading</AccessibleButton>);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
