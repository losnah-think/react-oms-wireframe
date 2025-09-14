Mermaid 다이어그램 렌더 가이드

준비: 프로젝트 루트에서 `npm install`을 실행하여 devDependency에 설치된 `@mermaid-js/mermaid-cli`를 로컬에 확보합니다.

로컬에서 렌더링:

```bash
npm run diagrams:render
```

위 스크립트는 `docs/diagrams/*.mmd` 파일들을 PNG로 렌더하여 같은 폴더에 저장합니다.

CI(예시, GitHub Actions)에서 렌더링하기 위해서는 Node.js를 설치한 후 `npm ci` 및 `npm run diagrams:render`를 실행하면 됩니다.

팁:
- SVG가 필요하면 `-o docs/diagrams/orders-list.svg` 처럼 확장자를 `.svg`로 지정할 수 있습니다.
- 배경을 투명으로 지정하려면 `-b transparent`를 사용합니다.

배포(예: GitHub Pages) 전 주의사항

- `docs` 폴더에 렌더된 이미지(`*.png`, `*.svg`)는 `.gitignore`에 추가되어 있으므로 커밋되지 않습니다.
- 배포 시 `docs` 폴더 전체를 포함하려면 이미지 파일을 수동으로 커밋하거나 CI에서 렌더 후 배포 스텝을 실행해야 합니다.

권장 배포 순서 (로컬):

```bash
# 1. 의존성 설치
npm install

# 2. 다이어그램 렌더
npm run diagrams:render

# 3. docs 전체를 gh-pages로 배포
npm run deploy:docs
```

권장 CI 흐름(GitHub Actions):

1. `npm ci`
2. `npm run diagrams:render`
3. `npm run deploy:docs`

