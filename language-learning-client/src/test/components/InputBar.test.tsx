import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import { InputBar } from '@/components/InputBar';
import { vi } from 'vitest';

test('InputBar component - when ready is true', async () => {
    const mockSetInputText = vi.fn()
    const mockHandleTranslation = vi.fn()

    render(<InputBar inputText='' setInputText={mockSetInputText} handleTranslation={mockHandleTranslation} ready={true} />)

    const textarea = screen.getByRole('textbox')
    const inputText = 'Testing input handling';

    // Manually simulating the change event for each character, the function will be called multiple times
    for (let i = 0; i < inputText.length; i++) {
        fireEvent.change(textarea, { target: { value: inputText.substring(0, i + 1) } })
        expect(mockSetInputText).toHaveBeenCalledTimes(i + 1)
        expect(mockSetInputText).toHaveBeenCalledWith(inputText.substring(0, i + 1))
    }

    expect(mockSetInputText).toHaveBeenCalledTimes(inputText.length)
    expect(mockSetInputText).toHaveBeenCalledWith(inputText)

    const translateButton = screen.getByRole('button', { name: /Translate/i })
    await fireEvent.click(translateButton)
    expect(mockHandleTranslation).toHaveBeenCalled()
})

test('InputBar component - when ready is false', async () => {
    const mockSetInputText = vi.fn()
    const mockHandleTranslation = vi.fn()

    render(<InputBar inputText='' setInputText={mockSetInputText} handleTranslation={mockHandleTranslation} ready={false} />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea).toBeDisabled()

    const loadingButton = screen.getByRole('button', { name: /Loading/i }) as HTMLButtonElement
    expect(loadingButton).toBeInTheDocument()
    expect(loadingButton).toBeDisabled()


    await userEvent.type(textarea, 'Testing input handling')
    expect(mockSetInputText).toHaveBeenCalledTimes(0)

    expect(loadingButton).toBeDisabled()
    expect(mockHandleTranslation).not.toHaveBeenCalled()
    
})
