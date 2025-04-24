'use client'
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

const LanguageSwitcher: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const languages = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' }
  ]

  const handleLanguageChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="language-menu"
          aria-haspopup="true"
        >
          {languages.find(lang => lang.code === locale)?.name}
        </button>
      </div>
      <div
        className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="language-menu"
      >
        <div className="py-1" role="none">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`${
                locale === language.code
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700'
              } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
              role="menuitem"
            >
              {language.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LanguageSwitcher 