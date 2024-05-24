import { fireEvent, render, screen } from "@testing-library/react";
import { IndexPage } from "@/IndexPage";

describe('IndexPage', () => {
    it('renders without crashing', () => {
        render(<IndexPage />);
        // Assert that the component renders without crashing
        const translationTextArea = screen.getByPlaceholderText(
            /Type in your sentence here. Note: A sentence is better for us to handle./i
        );
        expect(translationTextArea).toBeInTheDocument();

        const translateButton = screen.getByRole('button', { name: /Translate/i });
        expect(translateButton).toBeInTheDocument();

        // Check for the presence of the username and pin text
        const usernameAndPinText = screen.getByText(/Test username: 0000 Test pin: 0000/i);
        expect(usernameAndPinText).toBeInTheDocument();
    });
    // Test Dropdown functionality
    it('handles language selection', async () => {
        render(<IndexPage />);
        
        // Click on the language dropdown button
        const dropdownButton = screen.getByRole('button', { name: /Finnish/i });
        fireEvent.click(dropdownButton);
    
        // Select a language from the dropdown menu
        const languageOption = await screen.findByText(/Chinese/i);
        fireEvent.click(languageOption);
    
        // Verify that the selected language updates in the component state
        const selectedLanguage = screen.getByText(/Chinese/i);
        expect(selectedLanguage).toBeInTheDocument();
    });
    // Test Local Storage Interaction
    it('loads data from local storage', () => {
        const mockResponse = {
            sentence: 'Hello, world!',
            words: [{ id: '1', text: 'Hello'}, { id: '2', text: 'world'}]
        }
        localStorage.setItem('response', JSON.stringify(mockResponse))
        render(<IndexPage />)
        // Verify that the saved data is loaded correctly
        const translatedSentence = screen.getByText(/Hello, world!/i);
        expect(translatedSentence).toBeInTheDocument()
    })
    
});
