import { render, screen, fireEvent } from '@testing-library/react';
import ImageUpload from '../src/components/ImageUpload';

// simple smoke test
it('renders input', () => {
  render(<ImageUpload label="test" onSelect={() => {}} />);
  const input = screen.getByLabelText(/test/i);
  expect(input).toBeInTheDocument();
});

it('shows error for wrong file type', () => {
  render(<ImageUpload label="test" onSelect={() => {}} />);
  const input = screen.getByLabelText(/test/i) as HTMLInputElement;

  const file = new File(['(⌐□_□)'], 'chuck.txt', { type: 'text/plain' });
  fireEvent.change(input, { target: { files: [file] } });

  expect(screen.getByText(/only jpeg or png allowed/i)).toBeInTheDocument();
});
