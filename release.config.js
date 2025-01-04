module.exports = {
	branches: ['main'],
	plugins: [
		// コミット履歴からバージョン番号を決定する
		'@semantic-release/commit-analyzer',
		// バージョン番号に基づいてリリースノートを生成する
		'@semantic-release/release-notes-generator',
		// @semantic-release/release-notes-generator で生成されたリリースノートを CHANGELOG.md に追記する
		'@semantic-release/changelog',
		[
			// package.jsonのバージョンを更新する
			// npmjsにパッケージを公開する
			// npm dist-tagコマンドを実行しパッケージにタグをつける
			'@semantic-release/npm',
			{
				pkgRoot: 'dist/ngrx-extension',
			},
		],
		[
			// リリースの際に発生したアセットの更新差分をリポジトリにコミットする
			'@semantic-release/git',
			{
				assets: ['package.json', 'CHANGELOG.md'],
				message:
					'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
			},
		],
	],
};
