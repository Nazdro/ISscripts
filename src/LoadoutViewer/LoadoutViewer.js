class LoadoutViewer {

    config;

    constructor(config) {
        this.config = config;
        let attachToSocket = setInterval(() => {
            if (typeof window.IdlescapeListener !== "undefined") {
                clearInterval(attachToSocket);
                window.IdlescapeListener.messages.addEventListener("message", message => this.parseSocketMessage(message));
                console.log('Loadout Viewer: Attached to IdlescapeSocketListener');
            }
        }, 100);
    }

    parseSocketMessage(message){
        switch (message.event){
            case "update player":
                this.parseUpdatePlayerMessage(message);
                break;
            default:
                break;
        }
    }

    parseUpdatePlayerMessage(message){
        if (message.data['portion'] === "all") {
            this.config.load(message.data['value']['username']);
            this._processLoadoutsMessage(message.data['value']['loadouts']);
        } else if (Array.isArray(message.data['portion']) && message.data['portion'].includes("loadouts")) {
            this._processLoadoutsMessage(message.data['value']);
        }
    }

    _processLoadoutsMessage(loadouts){
        this.config.gearLoadouts = {};
        this.config.foodLoadouts = {};
        loadouts.forEach(item=> {
            if (item.loadout_id > 0) {
                if (!(item.loadout_id in this.config.gearLoadouts)) this.config.gearLoadouts[item.loadout_id] = [];
                this.config.gearLoadouts[item.loadout_id].push(item);
            } else {
                if (!(item.loadout_id in this.config.foodLoadouts)) this.config.foodLoadouts[item.loadout_id] = [];
                this.config.foodLoadouts[item.loadout_id].push(item);
            }
        })
    }
}