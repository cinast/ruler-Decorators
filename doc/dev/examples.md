# 例子 examples

1.  小型语言模组

```ts
class I18nStore {
    // 自动返回当前语言版本
    @$conditionalRead(
        [(_, key) => currentLang in this.translations[key]],
        [(_, key) => this.translations[key]["en"]] // 默认返回英文
    )
    getText(key: string): string {
        return "";
    }
    private translations = {
        welcome: {
            en: "Welcome",
            zh: "欢迎",
        },
    };
}
```
