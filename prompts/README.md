# Prompt 模板目录

每种首饰类型对应一个独立的 `.txt` prompt 文件。程序运行时根据配置的 `jewelryType` 自动加载对应文件。

## 文件结构

```
prompts/
├── necklace.txt      # 项链 prompt
├── earring.txt       # 耳环 prompt（待扩展）
├── ring.txt          # 戒指 prompt（待扩展）
└── README.md         # 本说明文件
```

## 使用方式

在 `config.ts` 中设置 `jewelryType`，程序会自动加载 `prompts/{jewelryType}.txt`。

## Prompt 编写建议

- 明确描述首饰的合成位置（颈部/耳部/手指）
- 强调保留模特原始形态不变
- 强调首饰细节必须清晰、忠实于原图
- 指定输出风格（电商产品图、珠宝摄影风格）
- 可用 `{jewelryHint}` 占位符（程序运行时自动替换为首饰文件名相关描述）
