import { createContext, useContext, useState } from 'react'
import { strings } from '../i18n/strings'

/**
 * LanguageContext provides current language state and a function to switch languages.
 * We store all text in strings.js for easy translation.
 */
const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // Default language can be set to 'en', 'es', etc.
  const [language, setLanguage] = useState('en')

  // Helper to retrieve the correct text dictionary
  function t(key) {
    return strings[language][key] || key
  }

  function switchLanguage(lang) {
    setLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
