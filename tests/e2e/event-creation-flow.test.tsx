import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CreateEventPage from '@/app/events/new/page';
import * as eventActions from '@/app/actions/event-actions';

describe('UI End-to-End User Flow: Create Group, Add Members, Send Emails', () => {
  it('allows user to fill group details, add participants, and triggers the send button to show results', async () => {
    // Spy on the Server Action to verify parameters and simulate successful execution
    const actionSpy = vi.spyOn(eventActions, 'createEventAndDrawAction').mockResolvedValue({
      success: true,
      eventId: 'mock-event-uuid-1234',
      message: 'Secret Santa exchange created successfully! Persisted securely in MySQL.',
      participantsCount: 4,
      emailsSent: 4,
      inviteLinks: [
        {
          participantId: '1',
          name: 'Alice Smith',
          email: 'alice@example.com',
          revealUrl: 'http://localhost:3001/reveal/token-alice',
        },
        {
          participantId: '2',
          name: 'Bob Jones',
          email: 'bob@example.com',
          revealUrl: 'http://localhost:3001/reveal/token-bob',
        },
        {
          participantId: '3',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          revealUrl: 'http://localhost:3001/reveal/token-charlie',
        },
        {
          participantId: '4',
          name: 'Diana Prince',
          email: 'diana@example.com',
          revealUrl: 'http://localhost:3001/reveal/token-diana',
        },
      ],
    });

    render(<CreateEventPage />);

    // 1. Enter Event Title
    const titleInput = screen.getByLabelText(/event name/i);
    fireEvent.change(titleInput, { target: { value: 'Winter Wonderland Gala 2026' } });
    expect(titleInput).toHaveValue('Winter Wonderland Gala 2026');

    // 2. Set Budget
    const budgetInput = screen.getByLabelText(/suggested budget/i);
    fireEvent.change(budgetInput, { target: { value: '50' } });
    expect(budgetInput).toHaveValue(50);

    // 3. Add a 4th Participant via form
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const addButton = screen.getByRole('button', { name: /^add$/i });

    fireEvent.change(nameInput, { target: { value: 'Diana Prince' } });
    fireEvent.change(emailInput, { target: { value: 'diana@example.com' } });
    fireEvent.click(addButton);

    // Check that Diana Prince is listed in roster
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
    expect(screen.getByText('diana@example.com')).toBeInTheDocument();

    // 4. Hit the "Draw Names & Send Secret Emails" button
    const sendButton = screen.getByRole('button', {
      name: /draw names & send secret emails/i,
    });
    expect(sendButton).toBeInTheDocument();
    fireEvent.click(sendButton);

    // 5. Verify the Server Action was invoked with proper data
    await waitFor(() => {
      expect(actionSpy).toHaveBeenCalledTimes(1);
    });

    expect(actionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Winter Wonderland Gala 2026',
        budgetAmount: 50,
        participants: expect.arrayContaining([
          expect.objectContaining({ name: 'Alice Smith', email: 'alice@example.com' }),
          expect.objectContaining({ name: 'Bob Jones', email: 'bob@example.com' }),
          expect.objectContaining({ name: 'Charlie Brown', email: 'charlie@example.com' }),
          expect.objectContaining({ name: 'Diana Prince', email: 'diana@example.com' }),
        ]),
      })
    );

    // 6. Verify the Success View rendered
    await waitFor(() => {
      expect(screen.getByText(/secret santa drawn successfully!/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText('4').length).toBe(2); // 4 Participants & 4 Emails Triggered
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
    expect(screen.getAllByText(/copy link/i).length).toBe(4);

    actionSpy.mockRestore();
  });
});
