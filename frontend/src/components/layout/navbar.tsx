"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon, TrendingUp, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import logoSvg from '@/app/image.svg'

const Navbar = () => {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  
  // 在客户端挂载后再渲染主题切换按钮
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // 确保在服务器端和客户端渲染一致
  const currentTheme = mounted ? theme : 'light'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: '/', label: '首页', icon: <TrendingUp className="h-4 w-4 mr-2" /> },
    { href: '/stock', label: '股票分析', icon: <TrendingUp className="h-4 w-4 mr-2" /> },
    { href: '/futures', label: '期货分析', icon: <TrendingUp className="h-4 w-4 mr-2" /> },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold flex items-center">
              <Image 
                src={logoSvg} 
                alt="智子起源 Logo" 
                width={24} 
                height={24} 
                className="mr-2"
              />
              <span>智子起源</span>
            </Link>
          </div>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                aria-label="切换主题"
              >
                {currentTheme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="菜单"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden pt-2 pb-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {mounted && (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
                    setIsMenuOpen(false)
                  }}
                >
                  {currentTheme === 'dark' ? (
                    <SunIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <MoonIcon className="h-4 w-4 mr-2" />
                  )}
                  切换主题
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
