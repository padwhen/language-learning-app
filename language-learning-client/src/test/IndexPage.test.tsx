import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { IndexPage } from "@/pages/IndexPage";

describe('IndexPage', () => {
    // Test Local Storage Interaction
    it('loads data from local storage', () => {
        const mockResponse = {
            sentence: 'Hello, world!',
            words: [{ id: '1', text: 'Hello'}, { id: '2', text: 'world'}]
        }
        localStorage.setItem('response', JSON.stringify(mockResponse))
        render(
            <MemoryRouter>
                <IndexPage />
            </MemoryRouter>
        )
        // Verify that the saved data is loaded correctly
        const translatedSentence = screen.getByText(/Hello, world!/i);
        expect(translatedSentence).toBeInTheDocument()
    })
});
