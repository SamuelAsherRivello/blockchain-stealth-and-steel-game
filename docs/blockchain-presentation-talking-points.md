# Blockchain Presentation Talking Points

## Summary

- Peer-to-peer player trading
- Player-to-player item trading
- Item crafting
- Item upgrading
- Item bundles in the marketplace
- Cross-game compatibility of items
- Items that mature (Imagine a sword that remembers every kill.)

## The Game: What It Does Today

Stealth & Steel is a portrait-oriented browser game built with Babylon.js Lite, WebGPU, JavaScript, and Tiled-authored levels.

- Players explore stealth-focused levels with enemies, hazards, treasure, and objectives.
- The game includes character movement, combat, health, enemy perception, and AI reactions.
- Players can collect and equip items such as Shoes, Daggers, and Shields.
- Equipment can affect gameplay attributes such as movement speed or combat performance.
- The game supports trophies and achievement-style rewards.
- Players can continue after losing through a paid revival flow.
- The game can be played without an account when blockchain features are unavailable.
- BIS provides the game with account, wallet, payment, asset, and reward capabilities.
- The game can respond to confirmed blockchain events without exposing wallet internals.
- The game is designed to keep gameplay separate from blockchain implementation details.

## The Game: Future Blockchain Opportunities

These are possible features to tease as future directions rather than current commitments.

- Player-owned equipment that remains available across sessions and devices.
- Verifiable trophies that prove a player completed a difficult level or challenge.
- Rare equipment drops that can be collected, traded, or sold.
- Crafting items from materials earned during gameplay.
- Upgrading equipment by combining items, resources, or duplicate assets.
- Equipment with provable rarity, history, and upgrade lineage.
- Seasonal challenges that issue limited-time rewards.
- Player-versus-player tournaments with entry fees and prize pools.
- Paid continuation, tournament, or challenge mechanics with transparent rules.
- Equipment earned in Stealth & Steel becoming useful in another compatible game.
- Player-run guilds or teams with shared treasuries and collective rewards.
- Creator-designed levels or challenges that can offer their own rewards.
- On-chain proof of achievement without requiring the game to reveal private wallet information.
- Dynamic missions where player-owned items change how a level can be approached.
- A player reputation system based on completed challenges, not just purchases.

> Today, blockchain helps connect the account, wallet, and reward systems. In the future, it could become part of the game’s progression system—giving players ownership, history, and new ways to participate.

## The Marketplace: What It Does Today

- The marketplace displays registered games and their available equipment.
- It currently includes Stealth & Steel equipment such as Shoes, Daggers, and Shields.
- Items have artwork, tiers, descriptions, effects, and pricing information.
- Players can filter by game, owner, and equipment family.
- Players can inspect individual item details and related asset information.
- The marketplace can show wallet inventory and distinguish owned items from catalog items.
- Users can connect through the shared BIS Account experience.
- Supported users can buy and sell items through wallet-backed checkout flows.
- The marketplace tracks payment, asset delivery, pending status, and reconciliation.
- It is designed not to present a purchase as complete until ownership is actually confirmed.

## The Marketplace: Future Opportunities

### Peer-to-peer player trading

- Direct trades between two players.
- Secure trade offers where both sides approve before settlement.
- Item-for-item trades, item-for-bitcoin trades, or mixed trades.
- Trade history and visible ownership provenance.
- Escrow-style protection for incomplete or disputed trades.

### Item crafting

- Combine materials and lower-tier items to create a new item.
- Discover crafting recipes through gameplay.
- Issue rare recipes as rewards.
- Give player-created items a permanent crafting history.
- Add crafting stations, professions, or factions inside the game world.

### Item upgrading

- Upgrade an existing item’s tier or attributes.
- Combine duplicate items to increase rarity.
- Introduce risk-and-reward enhancement systems where upgrades consume resources.
- Record upgrade levels as part of an item’s history.
- Award special upgrade materials for difficult missions.

### Other marketplace possibilities

- Item bundles containing equipment, materials, and cosmetic items.
- Auctions and timed sales.
- Rentals or temporary equipment lending.
- Limited seasonal collections.
- Cross-game compatibility for items that follow a shared metadata standard.
- Creator storefronts for approved game content.
- Price history and market analytics.
- Buyback, recycling, or item-burning mechanics.

> Buying and selling is only the first layer. The bigger opportunity is creating an economy where players trade, craft, upgrade, collect, and build histories around the things they earn.

## The Business: What BIS Does Today

Blockchain Integration Service, or BIS, is the reusable integration layer that connects games, players, wallets, assets, payments, and rewards.

- Reusable integration infrastructure for browser games.
- Account creation and account restoration flows.
- Wallet connectivity and browser-local account persistence.
- Balance and activity views.
- Receiving addresses and sending workflows.
- Bitcoin and Arkade transfer support through configured networks.
- Asset minting, ownership checks, listing, and burning workflows.
- Game-wallet operations for assets and rewards.
- Pay-to-play or paid-continuation mechanics.
- Player reward and trophy workflows.
- Limited-time contract and offer workflows.
- A reusable React Account UI.
- A public game-facing API that hides wallet and Arkade implementation details.
- An Admin harness for testing and demonstrating integration behavior.
- A Marketplace consumer that uses the same underlying integration layer.
- Support for Signet and Mutinynet development workflows.
- Safe handling of pending, unavailable, failed, and unverified network results.
- A design that does not require a BIS-operated backend or custody service.

> BIS is not the game and it is not the marketplace. It is the reusable layer that lets many games add accounts, wallets, assets, payments, and blockchain-aware rewards without rebuilding those systems from scratch.

## The Business: What BIS Could Do Next

- Provide a polished SDK that lets any browser game integrate BIS with a few lines of code.
- Offer standardized asset metadata so items are recognizable across compatible games.
- Provide a developer portal with documentation, sandbox accounts, test wallets, and integration diagnostics.
- Offer hosted marketplace infrastructure for games that do not want to build their own trading UI.
- Provide player-to-player trading primitives that games can embed directly.
- Expose reusable crafting and upgrade systems as configurable APIs.
- Create shared achievement and trophy standards across multiple games.
- Support cross-game inventory and identity experiences.
- Provide tournament, challenge, and prize-contract infrastructure.
- Support game-specific wallet policies and configurable economic rules.
- Offer privacy-safe analytics for item usage, trading activity, and player progression.
- Improve account portability across games while keeping recovery material private.
- Support additional Bitcoin-based providers or networks through adapters.
- Add optional production-grade hosted services if the business moves beyond the current no-custom-server prototype.
- Provide enterprise integrations for publishers that want blockchain features without owning wallet infrastructure.
- Give creators tools for issuing assets, designing recipes, and configuring reward campaigns.
- Improve fraud-resistant ownership and reward verification.
- Explore revenue through SDK licensing, marketplace services, infrastructure usage, or transaction facilitation.

## Closing Narrative

The presentation can follow three simple ideas:

1. The game creates the experience.
2. The marketplace gives game objects an economy.
3. BIS provides the reusable infrastructure that connects games, players, wallets, assets, and rewards.

> The current demos prove the connection between gameplay, wallets, assets, and marketplaces. The long-term opportunity is a platform where ownership is useful—not just collectible—and where every game can choose how much blockchain functionality makes sense for its players.
