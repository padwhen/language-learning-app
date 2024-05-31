import { fireEvent, render, screen } from "@testing-library/react";
import { IndexPage } from "@/IndexPage";

describe('IndexPage', () => {
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
