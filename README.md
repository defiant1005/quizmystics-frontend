# quizmystics-frontend

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

### Prettier

```sh
yarn format
```

### Typescript

```sh
yarn type-check
```

### Stylelint

```sh
yarn stylelint
```

# project structure
```
/
├── src/                        # Исходный код проекта
│   ├── assets/                 # Статические ресурсы
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── layouts/                
│   ├── scss/                   
│   ├── modules/               # Модули приложения (каждая папка представляет определенный функционал или страницу)
│   │   └── blog-page/
│   │       ├── api/
│   │       ├── components/
│   │       ├── composables/
│   │       ├── constants//index.ts
│   │       ├── helpers/
│   │       ├── usecases/
│   │       ├── types/index.ts
│   │       └── store/index.ts
│   ├── package/                # Конфигурации и вспомогательные файлы
│   │   ├── config/
│   │   │   └── axios.ts        # Настройки запросов
│   │   ├── global-helpers/          
│   │   │   └── index.ts        # Глобальные вспомогательные функции
│   │   ├── global-api/         
│   │   │   └── index.ts        # Глобальные API запросы
│   │   ├── composables/        # Глобальные кастомные хуки и логика
│   │   │   └── useComposable.ts
│   │   ├── stores/             # Сторы для глобальных данных
│   │   │   └── index.ts
│   │   ├── global-types/         
│   │   │   └── index.ts        # Глобальные интерфейсы и типы
│   │   ├── global-components/  # Глобальные компоненты
│   │   ├── global-usecases/    # Вспомогательные разовые функции
│   │   │   └── index.ts
│   │   └── global-constants  
│   │       └── index.ts        # Глобальные константы
│   │
│   ├── ui-kit/                 # Глобальные UI-компоненты
│   │   ├── buttons/
│   │   ├── inputs/
│   │   └── modals/
│   └── views/                  
├── .yarnrc                     # Yarn registry configuration
├── vite.config.ts              # Vite конфигурация
├── package.json                # Список зависимостей и скриптов проекта
└── yarn.lock                   # Lock файл Yarn
```


### Периодически нужно обновлять зависимости до новых версий, можно использовать [библиотеку](https://www.npmjs.com/package/npm-check-updates)

```sh
ncu -i --format group
```
