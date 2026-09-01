# Homebrew readiness

Future installation target:

```sh
brew tap F3rr1gn0/tap
brew install callmebot-notifier
```

The future formula should depend on `node`, download a versioned release or npm tarball with a SHA-256 checksum, install the package under `libexec`, and expose both `callmebot-notifier` and `cmb-notify`. An offline `test do` should run `cmb-notify --version` and `cmb-notify --help` only.

The binary name `notify` is intentionally not installed because Homebrew already ships a formula named `notify` that provides a `notify` executable.

## Formula strategies

The recommended first version is a Node formula: isolated `libexec` installation is reproducible and avoids `npm install -g` changing the user's system. A standalone binary may later improve installation ergonomics, but would add bundling, native-dependency, and cross-platform maintenance costs. It is not part of this MVP.

Indicative future formula:

```ruby
class CallmebotNotifier < Formula
  desc "Multi-channel notification CLI"
  homepage "https://github.com/F3rr1gn0/callmebot-notifier"
  url "https://registry.npmjs.org/callmebot-notifier/-/callmebot-notifier-VERSION.tgz"
  sha256 "SHA256"
  license "MIT"
  depends_on "node"

  def install
    libexec.install Dir["*"]
    bin.install_symlink libexec/"dist/cli.js" => "callmebot-notifier"
    bin.install_symlink libexec/"dist/cli.js" => "cmb-notify"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/cmb-notify --version")
    system bin/"cmb-notify", "--help"
  end
end
```

Phase 2: create `F3rr1gn0/homebrew-tap`, add `Formula/callmebot-notifier.rb`, point it at a release/tag, calculate the checksum, and test on macOS Apple Silicon plus Intel/Linux where available.
