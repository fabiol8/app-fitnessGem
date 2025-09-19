import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingFlow from '../OnboardingFlow';

describe('OnboardingFlow', () => {
  const renderFlow = (props = {}) => {
    const onComplete = vi.fn().mockResolvedValue();
    const user = { email: 'athlete@example.com' };

    render(
      <OnboardingFlow
        onComplete={onComplete}
        user={user}
        initialProfile={null}
        {...props}
      />
    );

    return { onComplete, user };
  };

  it('disables next button on personal info step until required fields are filled', async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.click(screen.getByRole('button', { name: /avanti/i }));

    expect(screen.getByText(/Informazioni personali/i)).toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: /avanti/i });
    expect(nextButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Es. 28'), '28');
    await user.type(screen.getByPlaceholderText('72'), '72');
    await user.type(screen.getByPlaceholderText('175'), '175');

    expect(nextButton).not.toBeDisabled();
  });

  it('completes onboarding and normalizes profile data', async () => {
    const user = userEvent.setup();
    const { onComplete } = renderFlow();

    // Step 0 -> 1
    await user.click(screen.getByRole('button', { name: /avanti/i }));

    // Step 1: personal info
    await user.type(screen.getByPlaceholderText('Es. 28'), '30');
    const weightInput = screen.getByPlaceholderText('72');
    await user.clear(weightInput);
    await user.type(weightInput, '80');
    const heightInput = screen.getByPlaceholderText('175');
    await user.clear(heightInput);
    await user.type(heightInput, '185');
    await user.click(screen.getByRole('button', { name: /avanti/i }));

    // Step 2: goals
    await user.click(screen.getByRole('button', { name: /weight loss/i }));
    await user.click(screen.getByRole('button', { name: /avanti/i }));

    // Step 3: experience & training
    await user.click(screen.getByRole('button', { name: /principiante/i }));
    await user.click(screen.getByRole('button', { name: /avanti/i }));

    // Step 4: nutrition
    await user.click(screen.getByRole('button', { name: /equilibrata/i }));
    await user.click(screen.getByRole('button', { name: /avanti/i }));

    // Step 5: preferences (defaults already set)
    await user.click(screen.getByRole('button', { name: /avanti/i }));

    const completeButton = await screen.findByRole('button', { name: /completa/i });

    await user.click(completeButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    const payload = onComplete.mock.calls[0][0];

    expect(payload).toEqual(
      expect.objectContaining({
        age: 30,
        weight: 80,
        height: 185,
        weeklyWorkouts: 3,
        experience: 'beginner',
        goals: expect.arrayContaining(['weight_loss']),
        trainingEnvironment: expect.arrayContaining(['home']),
        nutrition: expect.objectContaining({ dietType: 'balanced' })
      })
    );
  });
});
