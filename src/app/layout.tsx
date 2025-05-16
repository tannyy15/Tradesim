// Replace this

return (
  <html lang="en">
    <body className={inter.className}>{children}</body>
  </html>
);

// with

return (
  <html lang="en" suppressHydrationWarning>
    <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </body>
  </html>
);
