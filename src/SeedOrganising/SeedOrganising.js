class SeedOrganising {
	static meta = {
		name: 'Seed organising',
		description: "Reorganises the seeds in the farming pane so that they'll always be in the same order. As well as creating subheaders for Mysterious Seeds, 1x1 seeds and trees+bushes",
		image: 'https://raw.githubusercontent.com/daelidle/ISscripts/main/assets/images/LoadoutViewer/meta_image.png' //TODO change this to image of it working.
	};

	const mysteriousGroup = "Mysterious seeds";
	const singleGroup = "1x1 seeds";
	const multiGroup = "Bushes and trees";
	const undefGroup = "Other seeds";

	const mysteriousSeedName = "Mysterious Seed";
	static singleSlotSeedNames = [
		"Carrot Seed",
		"Potato Seed",
		"Wheat Seed",
		"Tomato Seed",
		"Mushroom Spore",
		"Chili Pepper Seed",
		"Sugarcane Seed",
		"Pumpkin Seed",
		"Rice Seed",
		"Peppercorn Seed",
	];
	static multiSlotSeedNames = [
		"Wildberry Bush Seed",
		"Tree Seed",
		"Oak Tree Seed",
		"Apple Tree Seed",
		"Banana Tree Seed",
		"Sageberry Bush Seed",
		"Maple Tree Seed",
		"Yew Tree Seed",
		"Elder Tree Seed",
	];
	
	seedMap = {};
	
	onGameReady(isFirstGameReady) {
		Array.from(this.multiSlotSeedNames).forEach(name => this.seedMap[name] = this.multiGroup);
		Array.from(this.singleSlotSeedNames).forEach(name => this.seedMap[name] = this.singleGroup);
		seedMap[this.mysteriousSeedName] = this.mysteriousGroup;
		
        this._setUpMeterMutationObserver();
	}
	
	_setupMeterMutationObserver() {
		const callback = function(mutationsList, observer) {
            const farmingContainers = document.getElementsByClassName("farming-container");
            if (farmingContainers.length === 0) { 
				return;
			}
			
			Array.from(farmingContainers).forEach(farmingContainer => {
				const seedAnchors = farmingContainer.getElementsByClassName("farming-seeds");
				
				if (seedAnchors.length < 1) {
					return;
				}
				
				seedAnchors[0].style.maxWidth = "305px"; // Firefox needs slightly more clearance to maintain 4 columns because they don't have hideaway scrollbars.
				this._organizeSeeds(seedAnchors[0]);
			});
		}
		
        // Observe Play Area DOM changes
        const mainAreaContainer = document.getElementsByClassName("combine-main-area")[0];
        const config = {attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(callback);
        observer.observe(mainAreaContainer, config);
	}
	
	_organizeSeeds(seedPanel) {
		const seedContainers = seedPanel.getElementsByClassName("farming-seed");

		const currentSeeds = {
			[this.mysteriousGroup] : [],
			[this.singleGroup] : [],
			[this.multiGroup] : [],
			[this.undefGroup] : []
		};
		
		const mysteriousSeedsMap = {};
		
		Array.from(seedContainers).forEach(seedItem => {
			const seedName = seedItem.getAttribute("data-for").split("farming-seeds")[0];
			if (seedName in this.seedMap) {
				currentSeeds[this.seedMap[seedName]].push(seedItem);
				
				// Will break if they ever introduce augmentable seeds...
				augs = seedItem.getElementsByClassName("item-augment");
				if (augs.length > 0) {
					mysteriousSeedsMap[augs[0].innerHTML] = seedItem;
				}
			}
			else {
				currentSeeds[this.undefGroup].push(seedItem);
			}
		});
		
		Array.from(seedPanel.childNodes).forEach(node => node.remove());
		
		Array.from(Object.keys(currentSeeds)).forEach(groupName => {
			if (currentSeeds[groupName].length > 0) {
				seedPanel.append(this._createSeedGroupingTitle(groupName));
				seedPanel.append(this._createSeedGroupingBorder());
				
				const seedHolder = this._createEmptySeedHolder();
				
				if (groupName === this.mysteriousGroup) {
					// Generate the 4x4 Mysterious seed grid:
					Array.from([4,3,2,1]).forEach( y => {
						Array.from([1,2,3,4]).forEach( x => {
							const sizeXxY = `${x}x${y}`;
							if (sizeXxY in mysteriousSeedsMap) {
								seedHolder.append(mysteriousSeedsMap[sizeXxY]);
							}
							else {
								seedHolder.append(this._createEmptyMysteriousSeedDiv(sizeXxY));
							}
						});
					});
				}
				else {
					Array.from(currentSeeds[groupName]).forEach( seed => seedPanel.append(seed));
				}
				
				seedPanel.append(seedHolder);
			}
		}
	}
	
	_createEmptyMysteriousSeedDiv(sizeXxY) {
		const div = document.createElement("div");
		div.innerHTML = `<div class="farming-seed item" data-tip="true" data-for="Mysterious Seed"><img src="/images/farming/mysterious_seed.png"><div class="centered">0</div><div class="item-augment">${sizeXxY}</div><span style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;"></span></div>`;
		return div;
	}
	
	_createSeedGroupingTitle(name) {
		const header = document.createElement("h5");
		header.classList.add("farming-seeds-title");
		header.innerHTML = name;
		return header;
	}
	
	_createSeedGroupingBorder() {
		const div = document.createElement("div");
		div.classList.add("farming-seeds-title-border");
		return div;
	}
	
	_createEmptySeedHolder() {
		const div = document.createElement("div");
		div.classList.add("all-items");
		return div;
	}
}