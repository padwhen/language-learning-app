import { render, screen } from '@testing-library/react'
import { TranslationBar } from '@/components/TranslationBar';

test('renders with default language Finnish', () => {
    render(<TranslationBar fromLanguage="Finnish" setFromLanguage={() => {}} />);
    const defaultLanguage = screen.getByText(/Finnish/i);
    expect(defaultLanguage).toBeInTheDocument();
});



