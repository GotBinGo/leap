import * as THREE from 'three';

export class TextureAnimator  {
    tilesHorizontal;
    tilesVertical;
    numberOfTiles;
    tileDisplayDuration;
    currentDisplayTime;
    currentTile;
    texture;
    backwards;

    constructor(texture, tilesHoriz, tilesVert, backwards, tileDispDuration) {
        this.tilesHorizontal = tilesHoriz;
        this.tilesVertical = tilesVert;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );
        this.tileDisplayDuration = tileDispDuration;
        this.currentDisplayTime = 0;
        this.currentTile = 0;
        this.texture = texture;
        this.backwards = backwards;
    }

    update ( milliSec ) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile === this.numberOfTiles) {
                this.currentTile = 0;
            }
            const currentColumn = this.currentTile % this.tilesHorizontal;
            this.texture.offset.x = currentColumn / this.tilesHorizontal;
            const currentRow = this.tilesHorizontal - Math.floor( this.currentTile / this.tilesHorizontal );
            this.texture.offset.y = currentRow / this.tilesVertical;
        }
    }
}
