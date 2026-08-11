import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type Theme = 'tokyo-night' | 'catppuccin';

function App() {
  const [theme, setTheme] = useState<Theme>('tokyo-night');
  useEffect(() => {
    void browser.storage.local.get('theme').then(({ theme }) => {
      if (theme === 'catppuccin' || theme === 'tokyo-night') setTheme(theme);
    });
  }, []);
  function selectTheme(value: Theme) {
    setTheme(value);
    void browser.storage.local.set({ theme: value });
  }
  return (
    <main
      data-theme={theme}
      className='bg-background text-foreground min-h-72 w-80 p-5'
    >
      <header className='border-border flex items-center gap-3 border-b pb-4'>
        <img src='/icon/512.png' className='size-11 rounded-xl' alt='Toolbox' />
        <div>
          <h1 className='m-0 text-base font-semibold'>Toolbox</h1>
          <p className='text-muted-foreground m-0 text-xs'>by vasen.dev</p>
        </div>
      </header>
      <section className='pt-5'>
        <h2 className='m-0 text-sm font-medium'>Settings</h2>
        <div className='border-border mt-3 rounded-lg border p-3'>
          <p className='m-0 text-sm'>Theme</p>
          <p className='text-muted-foreground mt-1 text-xs'>
            Choose the response viewer color scheme.
          </p>
          <div className='mt-3 flex gap-2'>
            <Button
              size='sm'
              variant={theme === 'tokyo-night' ? 'default' : 'outline'}
              onClick={() => selectTheme('tokyo-night')}
            >
              Tokyo Night
            </Button>
            <Button
              size='sm'
              variant={theme === 'catppuccin' ? 'default' : 'outline'}
              onClick={() => selectTheme('catppuccin')}
            >
              Catppuccin
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
