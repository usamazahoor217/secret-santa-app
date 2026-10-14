import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

describe('UI Components Design System Standards', () => {
  it('renders Button with strict 15px border radius class', () => {
    render(<Button variant="festive">Draw Names</Button>);
    const button = screen.getByRole('button', { name: /draw names/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('rounded-[15px]');
  });

  it('renders Card with strict 15px border radius class', () => {
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>Holiday Exchange</CardTitle>
        </CardHeader>
        <CardContent>Event Details</CardContent>
      </Card>
    );
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('rounded-[15px]');
  });

  it('renders Input with strict 15px border radius class and proper label accessibility', () => {
    render(
      <Input
        label="Spending Limit"
        placeholder="e.g. 50"
        error="Invalid budget"
      />
    );
    const input = screen.getByLabelText(/spending limit/i);
    expect(input).toBeInTheDocument();
    expect(input.className).toContain('rounded-[15px]');
    expect(screen.getByText(/invalid budget/i)).toBeInTheDocument();
  });
});
