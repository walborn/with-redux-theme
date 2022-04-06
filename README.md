# Тёмная тема в React с помощью Redux-toolkit

Эта статья является продолжением статьи [Тёмная тема в React с использованием css переменных в scss](https://habr.com/ru/post/656995/). Если в прошлый раз мы добавляли темную тему через родной реактовский контекст, то сейчас мы попробуем сделать всё то же самое, но с помощью `Redux`, точнее `redux-toolkit`

- [Репозиторий](https://github.com/walborn/with-redux-theme)
- [Демо](https://with-redux-theme-cevvne559-walborn.vercel.app/)

## Roadmap

Мы проделаем почти те же шаги, что и в прошлый раз:

1. Создадим `create-react-app` проект
2. Поменяем структуру приложения на более удобную
3. Добавим компонент переключателя темы с `redux-состоянием`
4. Объявим переменные для каждой темы, которые будут влиять на стили компонентов
5. `Bonus` Добавим роутинг

## Подготовка

1.  С помощью `create-react-app` создаём проект и сразу добавляем `sass` и `classnames` для удобства работы со стилями

```bash
> npx create-react-app with-redux-theme --template redux
> cd with-redux-theme
> npm i sass classnames -S
```

2. Поскольку все дальнейшие действия мы будем производить, находясь в папке `src`, то для удобства перейдем в неё

```bash
> cd src
```

3. Удалим ненужные файлы

```bash
# находимся внутри папки /src
> rm -rf app features App.css App.js App.test.js index.css logo.svg
```

4. Создадим удобную структуру приложения

```bash
# находимся внутри папки /src
> mkdir -p components/Theme
> touch index.scss root.js store.js
> touch components/Theme/{index.js,index.module.scss,slice.js}
```

Поддерево проекта внутри папки `/src` должно получиться таким 

```bash
src
├── components
│   └── Theme
│       ├── index.js
│       ├── index.module.scss
│       └── slice.js
├── index.js
├── index.scss
├── root.js
├── store.js
└── ...
```

Теперь будем писать код.

Поскольку мы внесли изменения в структуру, то перепишем наш `src/index.js`

```jsx
// src/index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import Root from './root'
import store from './store'

import './index.scss'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Root />
    </Provider>
  </React.StrictMode>
)
```

Вместо `App.js` я использую файл `root.js` с компонентом `Root`, который в конце концов у нас будет хранить роуты на страницы, но а пока...

```jsx
// src/root.js
import React from 'react'

const Root = () => (
	<div>There are will be Routes</div>
)

export default Root
```

Теперь можно приступить к третьей части - написание самой логики изменения темы

## Добавляем логику для темы

Сконфигурируем наш стор. В нем у нас будет один лишь редьюсер темы. Делаем его по аналогии с `counter`, который шел из коробки, но намного проще.

```scss
// src/store.js
import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './components/theme/slice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
})
```

Теперь реализуем сам редьюсер с остальной логикой, необходимой для работы темы.

```jsx
// src/components/theme/slice.js
import { createSlice } from '@reduxjs/toolkit'

// храним тему в локальном хранилище браузера
// если там ничего нет, то пробуем получить тему из настроек системы
// если и настроек нет, то используем темную тему
const getTheme = () => {
  const theme = `${window?.localStorage?.getItem('theme')}`
  if ([ 'light', 'dark' ].includes(theme)) return theme

  const userMedia = window.matchMedia('(prefers-color-scheme: light)')
  if (userMedia.matches) return 'light'

  return 'dark'
}

const initialState = getTheme()

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    set: (state, action) => action.payload,
  },
})

export const { set } = themeSlice.actions

export default themeSlice.reducer
```

На этом этапе у нас всё работает, но нет компонента, который бы изменял тему.
Релизуем его.

```jsx
// src/components/theme/index.js
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import cn from 'classnames'

import { set } from './slice'
import styles from './index.module.scss'

const Theme = ({ className }) => {
  const theme = useSelector((state) => state.theme)
  const dispatch = useDispatch()

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [ theme ])

  const handleChange = () => dispatch(set(theme === 'dark' ? 'light' : 'dark'))

  return (
    <div
      className={cn(className, styles.root, theme === 'dark' ? styles.dark : styles.light)}
      onClick={handleChange}
    />
  )
}

export default Theme
```

```scss
.root {
	position: relative;
  border-radius: 50%;
  display: block;
  height: 24px;
  overflow: hidden;
  width: 24px;
  transition: 0.5s all ease;
  input {
    display: none;
  }
  &:hover {
    cursor: pointer;
  }
  &:before {
    content: "";
    display: block;
    position: absolute;
  }
  &.light:before {
    animation-duration: 0.5s;
    animation-name: sun;
    background-color: var(--text-color);
    border-radius: 50%;
    box-shadow: 10px 0 0 -3.5px var(--text-color),
      -10px 0 0 -3.5px var(--text-color),
      0 -10px 0 -3.5px var(--text-color),
      0 10px 0 -3.5px var(--text-color),
      7px -7px 0 -3.5px var(--text-color),
      7px 7px 0 -3.5px var(--text-color),
      -7px 7px 0 -3.5px var(--text-color),
      -7px -7px 0 -3.5px var(--text-color);
    height: 10px;
    left: 7px;
    top: 7px;
    width: 10px;
    &:hover {
      background-color: var(--background-color);
      box-shadow: 10px 0 0 -3.5px var(--background-color),
                  -10px 0 0 -3.5px var(--background-color),
                  0 -10px 0 -3.5px var(--background-color),
                  0 10px 0 -3.5px var(--background-color),
                  7px -7px 0 -3.5px var(--background-color),
                  7px 7px 0 -3.5px var(--background-color),
                  -7px 7px 0 -3.5px var(--background-color),
                  -7px -7px 0 -3.5px var(--background-color);
    }
  }
  &.dark {
    &:before {
      animation-duration: .5s;
      animation-name: moon;
      background-color: var(--text-color);
      border-radius: 50%;
      height: 20px;
      left: 2px;
      top: 2px;
      width: 20px;
      z-index: 1;
      &:hover {
        background-color: var(--background-color);
      }
    }
    &:after {
      animation-duration: .5s;
      animation-name: moon-shadow;
      background: var(--background-color);
      border-radius: 50%;
      content: "";
      display: block;
      height: 18px;
      position: absolute;
      right: -2px;
      top: -2px;
      width: 18px;
      z-index: 2;
    }
  }
}

@keyframes sun {
  from {
    background-color: var(--background-color);
    box-shadow: 0 0 0 -5px var(--background-color),
                0 0 0 -5px var(--background-color),
                0 0 0 -5px var(--background-color),
                0 0 0 -5px var(--background-color),
                0 0 0 -5px var(--background-color),
                0 0 0 -5px var(--background-color),
                0 0 0 -5px var(--background-color),
                0 0 0 -5px var(--background-color);
  }
  to {
    background-color: var(--text-color);
    box-shadow: 10px 0 0 -3.5px var(--text-color),
                -10px 0 0 -3.5px var(--text-color),
                0 -10px 0 -3.5px var(--text-color),
                0 10px 0 -3.5px var(--text-color),
                7px -7px 0 -3.5px var(--text-color),
                7px 7px 0 -3.5px var(--text-color),
                -7px 7px 0 -3.5px var(--text-color),
                -7px -7px 0 -3.5px var(--text-color);
  }
}

@keyframes moon {
  from {
    height: 0;
    left: 12px;
    top: 12px;
    width: 0;
  }
  to {
    height: 20px;
    left: 2px;
    top: 2px;
    width: 20px;
  }
}

@keyframes moon-shadow {
  from {
    background-color: var(--background-color);
    height: 0;
    right: 7px;
    top: 7px;
    width: 0;
  }
  to {
    background-color: var(--background-color);
    height: 18px;
    right: -2px;
    top: -2px;
    width: 18px;
  }
}
```

Добавим наш компонент `Theme` на главную страницу.

```jsx
// src/root.js
import Theme from './components/Theme'

const Root = () => (
  <>
    <h1>Тёмная тема в React с помощью Redux-toolkit</h1>
	  <Theme />
  </>
)

export default Root
```

И чтобы все заработало как надо, нужно задать переменные для каждой темы. Задавать мы их будем через `css` переменные, поскольку те переменные, которые используются в `scss` нам не подойдут. `scss`  компилится в `css` довольно глупо, он просто подставляет значения переменных во всех местах, где они фигурируют.

```scss
// src/index.scss
:root[data-theme="light"] {
  --background-color: #ffffff;
  --text-color: #1C1E21;
}

:root[data-theme="dark"] {
  --background-color: #18191a;
  --text-color: #f5f6f7;
}

body {
  background: var(--background-color);
  color: var(--text-color);
}
```

Ура! Все работает! И теперь обещанный бонус - добавление роутов

## Добавляем роутинг

Для начала установим библиотеку

```bash
> npm i react-router-dom -S
```

Обернем все в провайдер от `react-router`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import * as serviceWorker from './serviceWorker'
import Root from './root'
import store from './store'

import './index.scss'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <Root />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
)

serviceWorker.unregister()
```

Теперь можно в файле `src/root.js` добавить такой код

```jsx
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Home from './pages/Home'
import NoMatch from './pages/NoMatch'

const Root () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
)

export default Root
```

Создадим недостающие компоненты

```bash
> mkdir -p src/pages/{Home,NoMatch} src/components/Layout
> touch src/pages/Home/index.js src/pages/NoMatch/index.js
> touch src/components/Layout/index.js
```

Страницы приложения я поместил в папку `/pages`, потому что мне нравится, как это сделано в `NextJS`

```jsx
// src/components/Layout/index.js
import { Outlet } from 'react-router-dom'

import Theme from '../Theme'

const Layout = () => (
  <>
    <Theme />
    <main>
      <Outlet />
    </main>
  </>
)

export default Layout
```

```jsx
// src/pages/Home/index.js
const Home = () => <h1>Home</h1>

export default Home
```

```jsx
// src/pages/NoMatch/index.js
import { Link } from 'react-router-dom'

const NoMatch = () => (
  <>
    <h1>Page Not Found</h1>
    <h2>We could not find what you were looking for.</h2>
    <p>
      <Link to="/">Go to the home page</Link>
    </p>
  </>
)

export default NoMatch
```

И теперь мы по умолчанию находимся на странице  `Home`, а если перейдем на любую [другую](http://localhost:3000/something), то нам откроется страница `NoMatch`
 