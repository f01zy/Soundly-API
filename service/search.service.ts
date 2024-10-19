import { IMusic } from "../interfaces/music.interface"
import { MusicService } from "./music.service"

const musicService = new MusicService()

export class SearchService {
  public async search(q: string, array: Array<IMusic>) {
    const regex = new RegExp(q, 'i');
    return array.filter(music => regex.test(music.name))
  }

  public async music(q: string, page: number = 1, pageSize: number = 10) {
    const array = await musicService.getAllMusic()
    let results = await this.search(q, array)

    const length = results.length;
    results = results.slice((page - 1) * pageSize, page * pageSize);

    return { results, length };
  }
}