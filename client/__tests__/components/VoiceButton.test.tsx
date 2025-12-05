import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceButton } from '../../components/voice/VoiceButton';

describe('VoiceButton', () => {
  it('renders correctly', () => {
    render(<VoiceButton isListening={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<VoiceButton isListening={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});